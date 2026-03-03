/**
 * Rate Limiter para prevenir ataques de fuerza bruta
 *
 * Implementa un sistema de limitación basado en IP/identifier
 * con ventana deslizante para el endpoint de login.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil: number | null;
}

// Store en memoria (en producción usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuración
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,           // Máximo 5 intentos
  windowMs: 60 * 1000,      // Ventana de 1 minuto
  blockDurationMs: 5 * 60 * 1000, // Bloqueo de 5 minutos tras exceder límite
};

/**
 * Limpia entradas expiradas del store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Limpiar si la ventana expiró y no está bloqueado
    if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs && !entry.blockedUntil) {
      rateLimitStore.delete(key);
    }
    // Limpiar si el bloqueo expiró
    if (entry.blockedUntil && now > entry.blockedUntil) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Verifica si un identificador está bloqueado por rate limit
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterMs: number | null;
  message: string;
} {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Sin entradas previas - permitir
  if (!entry) {
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      retryAfterMs: null,
      message: 'OK',
    };
  }

  // Verificar si está bloqueado
  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfterMs = entry.blockedUntil - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMs,
      message: `Demasiados intentos. Intente de nuevo en ${retryAfterSec} segundos.`,
    };
  }

  // Si el bloqueo expiró, resetear
  if (entry.blockedUntil && now >= entry.blockedUntil) {
    rateLimitStore.delete(identifier);
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      retryAfterMs: null,
      message: 'OK',
    };
  }

  // Verificar si la ventana expiró
  if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitStore.delete(identifier);
    return {
      allowed: true,
      remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts,
      retryAfterMs: null,
      message: 'OK',
    };
  }

  // Dentro de la ventana - verificar intentos
  const remainingAttempts = RATE_LIMIT_CONFIG.maxAttempts - entry.attempts;

  if (remainingAttempts <= 0) {
    // Bloquear
    entry.blockedUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
    const retryAfterSec = Math.ceil(RATE_LIMIT_CONFIG.blockDurationMs / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMs: RATE_LIMIT_CONFIG.blockDurationMs,
      message: `Demasiados intentos. Intente de nuevo en ${retryAfterSec} segundos.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts,
    retryAfterMs: null,
    message: 'OK',
  };
}

/**
 * Registra un intento de login (fallido)
 */
export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      blockedUntil: null,
    });
    return;
  }

  // Verificar si la ventana expiró
  if (now - entry.firstAttempt > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      blockedUntil: null,
    });
    return;
  }

  // Incrementar intentos
  entry.attempts += 1;

  // Si excede el límite, bloquear
  if (entry.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    entry.blockedUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
  }
}

/**
 * Registra un intento exitoso (resetea el contador)
 */
export function recordSuccessfulAttempt(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Obtiene el identificador del rate limit desde el request
 * Usa X-Forwarded-For si está detrás de un proxy, sino la IP directa
 */
export function getRateLimitIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    // X-Forwarded-For puede contener múltiples IPs, tomar la primera
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback: usar un identificador genérico (solo para desarrollo)
  return 'unknown-client';
}

/**
 * Exportar configuración para tests
 */
export const RATE_LIMIT_SETTINGS = { ...RATE_LIMIT_CONFIG };
