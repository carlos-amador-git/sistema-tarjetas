/**
 * Tests para Rate Limiter
 */

import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  RATE_LIMIT_SETTINGS,
} from '../rateLimit';

describe('Rate Limiter', () => {
  // Limpiar state entre tests usando un identifier único
  const getUniqueId = () => `test-${Date.now()}-${Math.random()}`;

  describe('checkRateLimit', () => {
    it('debe permitir el primer intento', () => {
      const id = getUniqueId();
      const result = checkRateLimit(id);

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(RATE_LIMIT_SETTINGS.maxAttempts);
      expect(result.retryAfterMs).toBeNull();
    });

    it('debe decrementar intentos restantes después de fallos', () => {
      const id = getUniqueId();

      recordFailedAttempt(id);
      const result = checkRateLimit(id);

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(RATE_LIMIT_SETTINGS.maxAttempts - 1);
    });

    it('debe bloquear después de exceder el límite', () => {
      const id = getUniqueId();

      // Registrar el máximo de intentos fallidos
      for (let i = 0; i < RATE_LIMIT_SETTINGS.maxAttempts; i++) {
        recordFailedAttempt(id);
      }

      const result = checkRateLimit(id);

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.message).toContain('Demasiados intentos');
    });
  });

  describe('recordSuccessfulAttempt', () => {
    it('debe resetear el contador después de login exitoso', () => {
      const id = getUniqueId();

      // Registrar algunos intentos fallidos
      recordFailedAttempt(id);
      recordFailedAttempt(id);

      // Login exitoso
      recordSuccessfulAttempt(id);

      // Verificar que se reseteó
      const result = checkRateLimit(id);
      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(RATE_LIMIT_SETTINGS.maxAttempts);
    });
  });

  describe('recordFailedAttempt', () => {
    it('debe registrar intentos fallidos correctamente', () => {
      const id = getUniqueId();

      recordFailedAttempt(id);
      let result = checkRateLimit(id);
      expect(result.remainingAttempts).toBe(4);

      recordFailedAttempt(id);
      result = checkRateLimit(id);
      expect(result.remainingAttempts).toBe(3);

      recordFailedAttempt(id);
      result = checkRateLimit(id);
      expect(result.remainingAttempts).toBe(2);
    });
  });

  describe('Configuración', () => {
    it('debe tener configuración por defecto correcta', () => {
      expect(RATE_LIMIT_SETTINGS.maxAttempts).toBe(5);
      expect(RATE_LIMIT_SETTINGS.windowMs).toBe(60000);
      expect(RATE_LIMIT_SETTINGS.blockDurationMs).toBe(300000);
    });
  });
});
