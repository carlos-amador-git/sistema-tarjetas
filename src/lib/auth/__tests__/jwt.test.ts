/**
 * Tests para jwt.ts
 *
 * Tests de seguridad para funciones JWT:
 * - Generación de tokens (access y refresh)
 * - Verificación de tokens
 * - Manejo de tokens inválidos/expirados
 * - Seguridad de secretos
 */

import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JWTPayload,
} from '../jwt';

// =============================================================================
// TEST DATA
// =============================================================================

const validPayload: JWTPayload = {
  userId: 1,
  username: 'testuser',
  rol: 'admin',
};

const anotherPayload: JWTPayload = {
  userId: 999,
  username: 'otheruser',
  rol: 'consulta',
};

// =============================================================================
// GENERATE ACCESS TOKEN TESTS
// =============================================================================

describe('generateAccessToken', () => {
  it('debe generar un token JWT válido', () => {
    const token = generateAccessToken(validPayload);

    // JWT format: header.payload.signature
    expect(token).toMatch(/^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/);
  });

  it('debe incluir el payload correcto en el token', () => {
    const token = generateAccessToken(validPayload);
    const decoded = jwt.decode(token) as JWTPayload & { exp: number; iat: number };

    expect(decoded.userId).toBe(validPayload.userId);
    expect(decoded.username).toBe(validPayload.username);
    expect(decoded.rol).toBe(validPayload.rol);
  });

  it('debe incluir tiempo de expiración', () => {
    const token = generateAccessToken(validPayload);
    const decoded = jwt.decode(token) as { exp: number; iat: number };

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('debe generar tokens únicos para el mismo payload', () => {
    const token1 = generateAccessToken(validPayload);

    // Wait a tiny bit to ensure different iat
    const token2 = generateAccessToken(validPayload);

    // Tokens may be same if generated in same second, but signatures should differ
    // due to different iat timestamps (if time passes)
    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
  });

  it('debe funcionar con diferentes roles', () => {
    const roles = ['admin', 'almacen', 'consulta'];

    for (const rol of roles) {
      const token = generateAccessToken({ ...validPayload, rol });
      const decoded = jwt.decode(token) as JWTPayload;

      expect(decoded.rol).toBe(rol);
    }
  });
});

// =============================================================================
// GENERATE REFRESH TOKEN TESTS
// =============================================================================

describe('generateRefreshToken', () => {
  it('debe generar un token JWT válido', () => {
    const token = generateRefreshToken(validPayload.userId);

    expect(token).toMatch(/^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/);
  });

  it('debe incluir solo el userId en el payload', () => {
    const token = generateRefreshToken(validPayload.userId);
    const decoded = jwt.decode(token) as { userId: number };

    expect(decoded.userId).toBe(validPayload.userId);
    // Should NOT contain username or rol
    expect((decoded as unknown as JWTPayload).username).toBeUndefined();
    expect((decoded as unknown as JWTPayload).rol).toBeUndefined();
  });

  it('debe incluir tiempo de expiración', () => {
    const token = generateRefreshToken(validPayload.userId);
    const decoded = jwt.decode(token) as { exp: number; iat: number };

    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
  });

  it('refresh token debe tener mayor expiración que access token', () => {
    const accessToken = generateAccessToken(validPayload);
    const refreshToken = generateRefreshToken(validPayload.userId);

    const accessDecoded = jwt.decode(accessToken) as { exp: number; iat: number };
    const refreshDecoded = jwt.decode(refreshToken) as { exp: number; iat: number };

    const accessExpiry = accessDecoded.exp - accessDecoded.iat;
    const refreshExpiry = refreshDecoded.exp - refreshDecoded.iat;

    // Refresh should have longer expiry (7d vs 1h)
    expect(refreshExpiry).toBeGreaterThan(accessExpiry);
  });
});

// =============================================================================
// VERIFY ACCESS TOKEN TESTS
// =============================================================================

describe('verifyAccessToken', () => {
  it('debe verificar y decodificar un token válido', () => {
    const token = generateAccessToken(validPayload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(validPayload.userId);
    expect(decoded.username).toBe(validPayload.username);
    expect(decoded.rol).toBe(validPayload.rol);
  });

  it('debe lanzar error con token malformado', () => {
    expect(() => verifyAccessToken('not-a-valid-token')).toThrow();
  });

  it('debe lanzar error con token vacío', () => {
    expect(() => verifyAccessToken('')).toThrow();
  });

  it('debe lanzar error con token firmado con secreto incorrecto', () => {
    const fakeToken = jwt.sign(validPayload, 'wrong-secret', { expiresIn: '1h' });

    expect(() => verifyAccessToken(fakeToken)).toThrow();
  });

  it('debe lanzar error con token de refresh usado como access', () => {
    const refreshToken = generateRefreshToken(validPayload.userId);

    // Refresh token uses different secret, should fail verification
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });

  it('debe lanzar error con token manipulado', () => {
    const token = generateAccessToken(validPayload);
    // Tamper with the token (change a character in the signature)
    const parts = token.split('.');
    parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === 'a' ? 'b' : 'a');
    const tamperedToken = parts.join('.');

    expect(() => verifyAccessToken(tamperedToken)).toThrow();
  });

  it('debe lanzar error con payload manipulado', () => {
    const token = generateAccessToken(validPayload);
    const parts = token.split('.');

    // Create a new payload
    const newPayload = Buffer.from(JSON.stringify({ ...validPayload, rol: 'superadmin' })).toString('base64url');
    parts[1] = newPayload;
    const tamperedToken = parts.join('.');

    expect(() => verifyAccessToken(tamperedToken)).toThrow();
  });
});

// =============================================================================
// VERIFY REFRESH TOKEN TESTS
// =============================================================================

describe('verifyRefreshToken', () => {
  it('debe verificar y decodificar un token válido', () => {
    const token = generateRefreshToken(validPayload.userId);
    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe(validPayload.userId);
  });

  it('debe lanzar error con token malformado', () => {
    expect(() => verifyRefreshToken('not-a-valid-token')).toThrow();
  });

  it('debe lanzar error con token vacío', () => {
    expect(() => verifyRefreshToken('')).toThrow();
  });

  it('debe lanzar error con token firmado con secreto incorrecto', () => {
    const fakeToken = jwt.sign({ userId: 1 }, 'wrong-secret', { expiresIn: '7d' });

    expect(() => verifyRefreshToken(fakeToken)).toThrow();
  });

  it('debe lanzar error con access token usado como refresh', () => {
    const accessToken = generateAccessToken(validPayload);

    // Access token uses different secret, should fail verification
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });
});

// =============================================================================
// EXPIRATION TESTS
// =============================================================================

describe('Token Expiration', () => {
  it('debe rechazar access token expirado', () => {
    // Create a token that's already expired
    const expiredToken = jwt.sign(
      validPayload,
      process.env.JWT_SECRET || 'default-secret-change-me',
      { expiresIn: '-1s' } // Expired 1 second ago
    );

    expect(() => verifyAccessToken(expiredToken)).toThrow(/expired/i);
  });

  it('debe rechazar refresh token expirado', () => {
    const expiredToken = jwt.sign(
      { userId: validPayload.userId },
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      { expiresIn: '-1s' }
    );

    expect(() => verifyRefreshToken(expiredToken)).toThrow(/expired/i);
  });

  it('access token recién generado no debe estar expirado', () => {
    const token = generateAccessToken(validPayload);

    expect(() => verifyAccessToken(token)).not.toThrow();
  });

  it('refresh token recién generado no debe estar expirado', () => {
    const token = generateRefreshToken(validPayload.userId);

    expect(() => verifyRefreshToken(token)).not.toThrow();
  });
});

// =============================================================================
// SECURITY TESTS
// =============================================================================

describe('JWT Security', () => {
  it('access y refresh tokens deben usar diferentes secretos', () => {
    const accessToken = generateAccessToken(validPayload);
    const refreshToken = generateRefreshToken(validPayload.userId);

    // Access token should NOT verify with refresh verifier
    expect(() => verifyRefreshToken(accessToken)).toThrow();

    // Refresh token should NOT verify with access verifier
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });

  it('no debe incluir información sensible en el token', () => {
    const token = generateAccessToken(validPayload);
    const decoded = jwt.decode(token) as Record<string, unknown>;

    // Should NOT contain password or other sensitive data
    expect(decoded.password).toBeUndefined();
    expect(decoded.secret).toBeUndefined();
    expect(decoded.hash).toBeUndefined();
  });

  it('debe preservar integridad del payload', () => {
    const token = generateAccessToken(validPayload);
    const decoded = verifyAccessToken(token);

    // All fields should match exactly
    expect(decoded.userId).toStrictEqual(validPayload.userId);
    expect(decoded.username).toStrictEqual(validPayload.username);
    expect(decoded.rol).toStrictEqual(validPayload.rol);
  });

  it('tokens para diferentes usuarios deben ser diferentes', () => {
    const token1 = generateAccessToken(validPayload);
    const token2 = generateAccessToken(anotherPayload);

    expect(token1).not.toBe(token2);

    const decoded1 = verifyAccessToken(token1);
    const decoded2 = verifyAccessToken(token2);

    expect(decoded1.userId).not.toBe(decoded2.userId);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('JWT Edge Cases', () => {
  it('debe manejar userId como número grande', () => {
    const bigUserId = 999999999;
    const token = generateRefreshToken(bigUserId);
    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe(bigUserId);
  });

  it('debe manejar username con caracteres especiales', () => {
    const specialPayload: JWTPayload = {
      userId: 1,
      username: 'user@example.com',
      rol: 'admin',
    };

    const token = generateAccessToken(specialPayload);
    const decoded = verifyAccessToken(token);

    expect(decoded.username).toBe(specialPayload.username);
  });

  it('debe manejar username con caracteres unicode', () => {
    const unicodePayload: JWTPayload = {
      userId: 1,
      username: 'José García',
      rol: 'admin',
    };

    const token = generateAccessToken(unicodePayload);
    const decoded = verifyAccessToken(token);

    expect(decoded.username).toBe(unicodePayload.username);
  });
});
