/**
 * Tests para CSRF Protection
 *
 * Tests para el módulo csrf.ts importando las funciones reales
 * y mockeando las dependencias de Next.js.
 */

// =============================================================================
// MOCKS - Deben estar antes de los imports
// =============================================================================

// Mock next/headers
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock NextResponse para next/server
const mockNextResponseJson = jest.fn((data, init) => ({
  status: init?.status || 200,
  headers: new Map([['X-CSRF-Token', '']]),
  json: async () => data,
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      const headers = new Map<string, string>();
      return {
        status: init?.status || 200,
        headers: {
          get: (key: string) => headers.get(key),
          set: (key: string, value: string) => headers.set(key, value),
        },
        json: async () => data,
      };
    },
  },
}));

// Mock NextRequest type
interface MockNextRequest {
  headers: {
    get: (name: string) => string | null;
  };
  method: string;
}

// Import después de mockear
import {
  generateCsrfToken,
  setCsrfCookie,
  getCsrfTokenFromCookie,
  validateCsrfToken,
  csrfProtection,
  createCsrfResponse,
} from '../csrf';

// =============================================================================
// SETUP
// =============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  mockCookieStore.get.mockReset();
  mockCookieStore.set.mockReset();
});

// =============================================================================
// generateCsrfToken TESTS
// =============================================================================

describe('generateCsrfToken', () => {
  it('debe generar un token de 64 caracteres (32 bytes hex)', () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(64);
  });

  it('debe generar tokens únicos', () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateCsrfToken());
    }
    expect(tokens.size).toBe(100);
  });

  it('debe generar solo caracteres hexadecimales', () => {
    const token = generateCsrfToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('debe ser criptográficamente aleatorio', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();

    expect(token1).not.toBe(token2);
    expect(token1.slice(0, 32)).not.toBe(token2.slice(0, 32));
  });

  it('no debe generar tokens con patrones predecibles', () => {
    const tokens: string[] = [];
    for (let i = 0; i < 50; i++) {
      tokens.push(generateCsrfToken());
    }

    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        let commonPrefix = 0;
        while (
          commonPrefix < tokens[i].length &&
          commonPrefix < tokens[j].length &&
          tokens[i][commonPrefix] === tokens[j][commonPrefix]
        ) {
          commonPrefix++;
        }
        expect(commonPrefix).toBeLessThan(8);
      }
    }
  });
});

// =============================================================================
// setCsrfCookie TESTS
// =============================================================================

describe('setCsrfCookie', () => {
  it('debe generar y establecer un token en la cookie', async () => {
    const token = await setCsrfCookie();

    expect(token).toHaveLength(64);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'csrf_token',
      token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 3600,
      })
    );
  });

  it('debe configurar secure=true en producción', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    await setCsrfCookie();

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'csrf_token',
      expect.any(String),
      expect.objectContaining({
        secure: true,
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('debe configurar secure=false en desarrollo', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    await setCsrfCookie();

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'csrf_token',
      expect.any(String),
      expect.objectContaining({
        secure: false,
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('debe retornar el token generado', async () => {
    const token = await setCsrfCookie();

    expect(typeof token).toBe('string');
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });
});

// =============================================================================
// getCsrfTokenFromCookie TESTS
// =============================================================================

describe('getCsrfTokenFromCookie', () => {
  it('debe retornar el token si existe en la cookie', async () => {
    const expectedToken = 'a'.repeat(64);
    mockCookieStore.get.mockReturnValue({ value: expectedToken });

    const token = await getCsrfTokenFromCookie();

    expect(token).toBe(expectedToken);
    expect(mockCookieStore.get).toHaveBeenCalledWith('csrf_token');
  });

  it('debe retornar null si la cookie no existe', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const token = await getCsrfTokenFromCookie();

    expect(token).toBeNull();
  });

  it('debe retornar null si la cookie tiene valor vacío', async () => {
    mockCookieStore.get.mockReturnValue({ value: '' });

    const token = await getCsrfTokenFromCookie();

    // El || null en el código convierte string vacío (falsy) a null
    expect(token).toBeNull();
  });
});

// =============================================================================
// validateCsrfToken TESTS
// =============================================================================

describe('validateCsrfToken', () => {
  const createMockRequest = (headerToken: string | null, method = 'POST') => {
    return {
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'x-csrf-token') return headerToken;
          return null;
        }),
      },
      method,
    } as MockNextRequest;
  };

  it('debe validar correctamente cuando tokens coinciden', async () => {
    const token = 'a'.repeat(64);
    mockCookieStore.get.mockReturnValue({ value: token });
    const request = createMockRequest(token);

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('debe rechazar si falta el header token', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'a'.repeat(64) });
    const request = createMockRequest(null);

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token CSRF no proporcionado en el header');
  });

  it('debe rechazar si falta la cookie', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const request = createMockRequest('a'.repeat(64));

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cookie CSRF no encontrada');
  });

  it('debe rechazar tokens de diferente longitud', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'a'.repeat(64) });
    const request = createMockRequest('a'.repeat(32));

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token CSRF inválido');
  });

  it('debe rechazar tokens que no coinciden', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'a'.repeat(64) });
    const request = createMockRequest('b'.repeat(64));

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Token CSRF inválido');
  });

  it('debe usar comparación timing-safe', async () => {
    const cookieToken = 'a'.repeat(63) + 'x';
    const headerToken = 'a'.repeat(63) + 'y';
    mockCookieStore.get.mockReturnValue({ value: cookieToken });
    const request = createMockRequest(headerToken);

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(false);
  });
});

// =============================================================================
// csrfProtection TESTS
// =============================================================================

describe('csrfProtection', () => {
  const createMockRequest = (
    method: string,
    headerToken: string | null = null
  ) => {
    return {
      headers: {
        get: jest.fn((name: string) => {
          if (name === 'x-csrf-token') return headerToken;
          return null;
        }),
      },
      method,
    } as MockNextRequest;
  };

  describe('métodos seguros (no requieren validación)', () => {
    it.each(['GET', 'HEAD', 'OPTIONS'])('debe retornar null para %s', async (method) => {
      const request = createMockRequest(method);

      const result = await csrfProtection(request);

      expect(result).toBeNull();
    });

    it.each(['get', 'head', 'options'])('debe ser case-insensitive para %s', async (method) => {
      const request = createMockRequest(method);

      const result = await csrfProtection(request);

      expect(result).toBeNull();
    });
  });

  describe('métodos que modifican datos', () => {
    it.each(['POST', 'PUT', 'DELETE', 'PATCH'])(
      'debe validar CSRF para %s',
      async (method) => {
        mockCookieStore.get.mockReturnValue(undefined);
        const request = createMockRequest(method, null);

        const result = await csrfProtection(request);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(403);
      }
    );

    it('debe retornar null si la validación es exitosa', async () => {
      const token = 'a'.repeat(64);
      mockCookieStore.get.mockReturnValue({ value: token });
      const request = createMockRequest('POST', token);

      const result = await csrfProtection(request);

      expect(result).toBeNull();
    });

    it('debe retornar 403 si la validación falla', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'a'.repeat(64) });
      const request = createMockRequest('POST', 'b'.repeat(64));

      const result = await csrfProtection(request);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });
  });
});

// =============================================================================
// createCsrfResponse TESTS
// =============================================================================

describe('createCsrfResponse', () => {
  it('debe crear response con el token en header', () => {
    const data = { message: 'success' };
    const token = 'a'.repeat(64);

    const response = createCsrfResponse(data, token);

    expect(response.headers.get('X-CSRF-Token')).toBe(token);
  });

  it('debe usar status 200 por defecto', () => {
    const response = createCsrfResponse({ ok: true }, 'token');

    expect(response.status).toBe(200);
  });

  it('debe permitir status personalizado', () => {
    const response = createCsrfResponse({ created: true }, 'token', 201);

    expect(response.status).toBe(201);
  });

  it('debe serializar datos como JSON', async () => {
    const data = { user: 'test', count: 42 };
    const response = createCsrfResponse(data, 'token');

    const body = await response.json();

    expect(body).toEqual(data);
  });
});

// =============================================================================
// SECURITY TESTS
// =============================================================================

describe('CSRF Security Properties', () => {
  it('los tokens generados deben tener suficiente entropía', () => {
    const token = generateCsrfToken();
    expect(token.length).toBe(64);

    const uniqueChars = new Set(token.split(''));
    expect(uniqueChars.size).toBeGreaterThan(5);
  });

  it('la validación debe ser case-sensitive', async () => {
    const token = 'abcdef0123456789'.repeat(4);
    mockCookieStore.get.mockReturnValue({ value: token });

    const request = {
      headers: { get: () => token.toUpperCase() },
      method: 'POST',
    } as MockNextRequest;

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(false);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('CSRF Edge Cases', () => {
  const createMockRequest = (headerToken: string | null) => {
    return {
      headers: { get: () => headerToken },
      method: 'POST',
    } as MockNextRequest;
  };

  it('debe manejar tokens con solo ceros', async () => {
    const token = '0'.repeat(64);
    mockCookieStore.get.mockReturnValue({ value: token });

    const result = await validateCsrfToken(createMockRequest(token));

    expect(result.valid).toBe(true);
  });

  it('debe manejar tokens con solo f (max hex)', async () => {
    const token = 'f'.repeat(64);
    mockCookieStore.get.mockReturnValue({ value: token });

    const result = await validateCsrfToken(createMockRequest(token));

    expect(result.valid).toBe(true);
  });

  it('debe rechazar tokens con espacios', async () => {
    const validToken = generateCsrfToken();
    const tokenWithSpace = validToken.slice(0, 32) + ' ' + validToken.slice(33);
    mockCookieStore.get.mockReturnValue({ value: validToken });

    const result = await validateCsrfToken(createMockRequest(tokenWithSpace));

    expect(result.valid).toBe(false);
  });
});

// =============================================================================
// INTEGRATION-LIKE TESTS
// =============================================================================

describe('CSRF Flow Simulation', () => {
  it('debe simular flujo completo de CSRF protection', async () => {
    // 1. Generate token (server sets cookie)
    const csrfToken = await setCsrfCookie();

    // 2. Simulate cookie being set
    mockCookieStore.get.mockReturnValue({ value: csrfToken });

    // 3. Client includes token in header
    const request = {
      headers: { get: () => csrfToken },
      method: 'POST',
    } as MockNextRequest;

    // 4. Validate
    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(true);
  });

  it('debe simular ataque CSRF (token diferente)', async () => {
    const victimToken = generateCsrfToken();
    mockCookieStore.get.mockReturnValue({ value: victimToken });

    const attackerToken = generateCsrfToken();
    const request = {
      headers: { get: () => attackerToken },
      method: 'POST',
    } as MockNextRequest;

    const result = await validateCsrfToken(request);

    expect(result.valid).toBe(false);
  });
});
