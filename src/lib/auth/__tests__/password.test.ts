/**
 * Tests para password.ts
 *
 * Tests de seguridad para funciones de hashing:
 * - Hashing con bcrypt
 * - Verificación de contraseñas
 * - Propiedades de seguridad
 * - Edge cases
 */

import { hashPassword, verifyPassword } from '../password';

// =============================================================================
// HASH PASSWORD TESTS
// =============================================================================

describe('hashPassword', () => {
  it('debe generar un hash bcrypt válido', async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);

    // bcrypt hash format: $2a$, $2b$, or $2y$ followed by cost factor
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it('el hash debe ser diferente del password original', async () => {
    const password = 'mySecurePassword';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).not.toContain(password);
  });

  it('el mismo password debe generar diferentes hashes (salt)', async () => {
    const password = 'samePassword';

    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    // Due to random salt, hashes should be different
    expect(hash1).not.toBe(hash2);
  });

  it('el hash debe tener longitud estándar de bcrypt (60 chars)', async () => {
    const password = 'anyPassword';
    const hash = await hashPassword(password);

    expect(hash.length).toBe(60);
  });

  it('debe funcionar con password vacío', async () => {
    const hash = await hashPassword('');

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(hash.length).toBe(60);
  });

  it('debe funcionar con password muy largo', async () => {
    // bcrypt has a 72 byte limit, but should handle longer gracefully
    const longPassword = 'a'.repeat(100);
    const hash = await hashPassword(longPassword);

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it('debe funcionar con caracteres especiales', async () => {
    const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const hash = await hashPassword(specialPassword);

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it('debe funcionar con caracteres unicode', async () => {
    const unicodePassword = '密码测试αβγδ🔐';
    const hash = await hashPassword(unicodePassword);

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });

  it('debe funcionar con espacios', async () => {
    const passwordWithSpaces = '  password with spaces  ';
    const hash = await hashPassword(passwordWithSpaces);

    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });
});

// =============================================================================
// VERIFY PASSWORD TESTS
// =============================================================================

describe('verifyPassword', () => {
  it('debe retornar true para password correcto', async () => {
    const password = 'correctPassword123';
    const hash = await hashPassword(password);

    const result = await verifyPassword(password, hash);

    expect(result).toBe(true);
  });

  it('debe retornar false para password incorrecto', async () => {
    const password = 'originalPassword';
    const hash = await hashPassword(password);

    const result = await verifyPassword('wrongPassword', hash);

    expect(result).toBe(false);
  });

  it('debe ser case sensitive', async () => {
    const password = 'CaseSensitive';
    const hash = await hashPassword(password);

    expect(await verifyPassword('CaseSensitive', hash)).toBe(true);
    expect(await verifyPassword('casesensitive', hash)).toBe(false);
    expect(await verifyPassword('CASESENSITIVE', hash)).toBe(false);
  });

  it('debe rechazar password con espacios extra', async () => {
    const password = 'noSpaces';
    const hash = await hashPassword(password);

    expect(await verifyPassword(' noSpaces', hash)).toBe(false);
    expect(await verifyPassword('noSpaces ', hash)).toBe(false);
    expect(await verifyPassword(' noSpaces ', hash)).toBe(false);
  });

  it('debe verificar password vacío correctamente', async () => {
    const emptyHash = await hashPassword('');

    expect(await verifyPassword('', emptyHash)).toBe(true);
    expect(await verifyPassword('notEmpty', emptyHash)).toBe(false);
  });

  it('debe verificar password con caracteres especiales', async () => {
    const password = '!@#$%^&*()';
    const hash = await hashPassword(password);

    expect(await verifyPassword('!@#$%^&*()', hash)).toBe(true);
    expect(await verifyPassword('!@#$%^&*(', hash)).toBe(false);
  });

  it('debe verificar password con unicode', async () => {
    const password = '密码🔐';
    const hash = await hashPassword(password);

    expect(await verifyPassword('密码🔐', hash)).toBe(true);
    expect(await verifyPassword('密码', hash)).toBe(false);
  });

  it('debe retornar false para hash malformado', async () => {
    const password = 'anyPassword';

    // bcrypt.compare returns false for invalid hashes (doesn't throw)
    const result = await verifyPassword(password, 'not-a-valid-hash');
    expect(result).toBe(false);
  });

  it('debe retornar false para hash vacío', async () => {
    const password = 'anyPassword';

    // bcrypt.compare returns false for empty hash
    const result = await verifyPassword(password, '');
    expect(result).toBe(false);
  });
});

// =============================================================================
// SECURITY PROPERTIES TESTS
// =============================================================================

describe('Password Security Properties', () => {
  it('diferentes usuarios con mismo password deben tener diferentes hashes', async () => {
    const commonPassword = 'password123';

    const hash1 = await hashPassword(commonPassword);
    const hash2 = await hashPassword(commonPassword);
    const hash3 = await hashPassword(commonPassword);

    // All should be different due to salt
    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);

    // But all should verify correctly
    expect(await verifyPassword(commonPassword, hash1)).toBe(true);
    expect(await verifyPassword(commonPassword, hash2)).toBe(true);
    expect(await verifyPassword(commonPassword, hash3)).toBe(true);
  });

  it('hash no debe revelar longitud del password', async () => {
    const shortPassword = 'ab';
    const longPassword = 'a'.repeat(50);

    const shortHash = await hashPassword(shortPassword);
    const longHash = await hashPassword(longPassword);

    // Both hashes should be same length (60 chars)
    expect(shortHash.length).toBe(longHash.length);
  });

  it('hash debe contener cost factor (salt rounds)', async () => {
    const hash = await hashPassword('test');

    // Extract cost factor from hash (position after $2b$)
    const costFactor = parseInt(hash.split('$')[2], 10);

    // Should be a reasonable cost factor (typically 10-14)
    expect(costFactor).toBeGreaterThanOrEqual(10);
    expect(costFactor).toBeLessThanOrEqual(14);
  });

  it('verificación debe tomar tiempo similar para correcto e incorrecto', async () => {
    const password = 'testPassword';
    const hash = await hashPassword(password);

    // Warmup - la primera llamada puede ser más lenta
    await verifyPassword(password, hash);
    await verifyPassword('wrongPassword', hash);

    // Medir múltiples iteraciones para reducir variabilidad
    const iterations = 3;
    let totalCorrect = 0;
    let totalWrong = 0;

    for (let i = 0; i < iterations; i++) {
      const startCorrect = Date.now();
      await verifyPassword(password, hash);
      totalCorrect += Date.now() - startCorrect;

      const startWrong = Date.now();
      await verifyPassword('wrongPassword', hash);
      totalWrong += Date.now() - startWrong;
    }

    const avgCorrect = totalCorrect / iterations;
    const avgWrong = totalWrong / iterations;

    // Times should be similar (within 150ms average) to prevent timing attacks
    // bcrypt's constant-time comparison ensures this property
    expect(Math.abs(avgCorrect - avgWrong)).toBeLessThan(150);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('Password Edge Cases', () => {
  it('debe manejar password con solo espacios', async () => {
    const password = '     ';
    const hash = await hashPassword(password);

    expect(await verifyPassword('     ', hash)).toBe(true);
    expect(await verifyPassword('    ', hash)).toBe(false); // One less space
  });

  it('debe manejar password con newlines', async () => {
    const password = 'line1\nline2';
    const hash = await hashPassword(password);

    expect(await verifyPassword('line1\nline2', hash)).toBe(true);
    expect(await verifyPassword('line1 line2', hash)).toBe(false);
  });

  it('debe manejar password con tabs', async () => {
    const password = 'with\ttab';
    const hash = await hashPassword(password);

    expect(await verifyPassword('with\ttab', hash)).toBe(true);
    expect(await verifyPassword('with tab', hash)).toBe(false);
  });

  it('bcrypt trunca passwords mayores a 72 bytes', async () => {
    // bcrypt only considers first 72 bytes
    const base = 'a'.repeat(72);
    const longer = base + 'extra';

    const hash = await hashPassword(base);

    // Both should verify as same because bcrypt truncates at 72 bytes
    expect(await verifyPassword(base, hash)).toBe(true);
    expect(await verifyPassword(longer, hash)).toBe(true);
  });

  it('debe manejar passwords similares como diferentes', async () => {
    const password1 = 'password123';
    const password2 = 'password124';
    const password3 = 'Password123';

    const hash = await hashPassword(password1);

    expect(await verifyPassword(password1, hash)).toBe(true);
    expect(await verifyPassword(password2, hash)).toBe(false);
    expect(await verifyPassword(password3, hash)).toBe(false);
  });
});

// =============================================================================
// ROUND-TRIP TESTS
// =============================================================================

describe('Password Round-Trip', () => {
  const testPasswords = [
    'simple',
    'With Numbers 123',
    'special!@#$%',
    'unicode密码',
    'MixedCASE123!',
    '',
    ' ',
    'a'.repeat(71), // Just under bcrypt limit
  ];

  it.each(testPasswords)('debe verificar correctamente: "%s"', async (password) => {
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);

    expect(result).toBe(true);
  });
});
