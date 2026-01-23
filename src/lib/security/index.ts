/**
 * Módulo de Seguridad - CardSystem
 *
 * Exporta todas las funcionalidades de seguridad:
 * - Rate Limiting
 * - CSRF Protection
 * - Sanitización de Inputs
 * - Audit Logging
 */

// Rate Limiting
export {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  getRateLimitIdentifier,
  RATE_LIMIT_SETTINGS,
} from './rateLimit';

// CSRF Protection
export {
  generateCsrfToken,
  setCsrfCookie,
  getCsrfTokenFromCookie,
  validateCsrfToken,
  csrfProtection,
  createCsrfResponse,
} from './csrf';

// Sanitización
export {
  escapeHtml,
  stripHtmlTags,
  sanitizeString,
  sanitizeObject,
  stripDangerousTags,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeNumber,
  detectSqlInjection,
  detectXssAttempt,
} from './sanitize';

// Audit Logging
export {
  useAuditLogStore,
  getDefaultSeverity,
  createAuditLog,
  logAuditEvent,
  extractRequestInfo,
  type AuditAction,
  type AuditSeverity,
  type AuditLogEntry,
} from './auditLog';
