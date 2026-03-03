/**
 * CSRF Protection para formularios
 *
 * Implementa tokens CSRF usando el patrón Double Submit Cookie
 * - El token se genera y almacena en una cookie httpOnly
 * - El mismo token debe enviarse en el header X-CSRF-Token
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Genera un token CSRF aleatorio
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Establece el token CSRF en una cookie
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60, // 1 hora
  });

  return token;
}

/**
 * Obtiene el token CSRF de la cookie
 */
export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CSRF_COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Valida el token CSRF del request
 * Compara el token del header con el de la cookie
 */
export async function validateCsrfToken(request: NextRequest): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Obtener token del header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!headerToken) {
    return {
      valid: false,
      error: 'Token CSRF no proporcionado en el header',
    };
  }

  // Obtener token de la cookie
  const cookieToken = await getCsrfTokenFromCookie();

  if (!cookieToken) {
    return {
      valid: false,
      error: 'Cookie CSRF no encontrada',
    };
  }

  // Comparar tokens de forma segura (timing-safe)
  if (headerToken.length !== cookieToken.length) {
    return {
      valid: false,
      error: 'Token CSRF inválido',
    };
  }

  // Comparación timing-safe
  let mismatch = 0;
  for (let i = 0; i < headerToken.length; i++) {
    mismatch |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return {
      valid: false,
      error: 'Token CSRF inválido',
    };
  }

  return { valid: true };
}

/**
 * Middleware helper para validar CSRF en API routes
 */
export async function csrfProtection(
  request: NextRequest
): Promise<NextResponse | null> {
  // Solo validar métodos que modifican datos
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null; // No requiere validación
  }

  const validation = await validateCsrfToken(request);

  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 403 }
    );
  }

  return null; // Validación exitosa
}

/**
 * Crea un response con un nuevo token CSRF
 */
export function createCsrfResponse<T>(
  data: T,
  csrfToken: string,
  status = 200
): NextResponse {
  const response = NextResponse.json(data, { status });

  // Agregar el token en un header para que el cliente lo use
  response.headers.set('X-CSRF-Token', csrfToken);

  return response;
}
