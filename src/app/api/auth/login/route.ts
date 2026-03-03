/**
 * API Route: Login
 *
 * Maneja la autenticación con seguridad mejorada:
 * - Rate limiting (5 intentos/minuto)
 * - Audit logging
 * - httpOnly cookies seguras
 * - Base de datos local con Prisma
 * - JWT tokens
 *
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  getRateLimitIdentifier,
  logAuditEvent,
  extractRequestInfo,
  sanitizeUsername,
} from '@/lib/security';
import prisma from '@/lib/db';
import { comparePassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

// Configuración de cookies seguras
// Nota: secure: true solo funciona con HTTPS. En localhost HTTP, debe ser false.
const isSecure = process.env.NODE_ENV === 'production' && process.env.ALLOW_HTTP_COOKIES !== 'true';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure,
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hora
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

interface LoginRequest {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  const identifier = getRateLimitIdentifier(request);

  try {
    // =========================================================================
    // 1. RATE LIMITING
    // =========================================================================
    const rateLimitCheck = checkRateLimit(identifier);

    if (!rateLimitCheck.allowed) {
      // Log del intento bloqueado
      await logAuditEvent({
        action: 'RATE_LIMIT_EXCEEDED',
        severity: 'ERROR',
        userId: null,
        username: null,
        ipAddress,
        userAgent,
        resource: 'auth',
        resourceId: null,
        details: {
          remainingAttempts: rateLimitCheck.remainingAttempts,
          retryAfterMs: rateLimitCheck.retryAfterMs,
        },
        success: false,
        errorMessage: rateLimitCheck.message,
      });

      return NextResponse.json(
        {
          error: rateLimitCheck.message,
          retryAfter: rateLimitCheck.retryAfterMs
            ? Math.ceil(rateLimitCheck.retryAfterMs / 1000)
            : null,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.retryAfterMs
              ? String(Math.ceil(rateLimitCheck.retryAfterMs / 1000))
              : '60',
          },
        }
      );
    }

    // =========================================================================
    // 2. VALIDACIÓN Y SANITIZACIÓN
    // =========================================================================
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    // Validar campos requeridos
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Sanitizar username (no password por seguridad)
    const sanitizedUsername = sanitizeUsername(username);
    if (!sanitizedUsername && username.length > 0) {
      // Si el username contiene caracteres inválidos
      recordFailedAttempt(identifier);

      await logAuditEvent({
        action: 'SECURITY_VIOLATION',
        severity: 'WARNING',
        userId: null,
        username: username.substring(0, 50), // Truncar para log
        ipAddress,
        userAgent,
        resource: 'auth',
        resourceId: null,
        details: { reason: 'Invalid username format' },
        success: false,
        errorMessage: 'Formato de usuario inválido',
      });

      return NextResponse.json(
        { error: 'Formato de usuario inválido' },
        { status: 400 }
      );
    }

    // =========================================================================
    // 3. AUTENTICACIÓN CON BASE DE DATOS
    // =========================================================================

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { username: sanitizedUsername || username }
    });

    // Verificar que el usuario existe y está activo
    if (!user || !user.activo) {
      recordFailedAttempt(identifier);

      // Log del intento fallido
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        severity: 'WARNING',
        userId: null,
        username: sanitizedUsername || username,
        ipAddress,
        userAgent,
        resource: 'auth',
        resourceId: null,
        details: {
          reason: !user ? 'User not found' : 'User inactive',
        },
        success: false,
        errorMessage: 'Credenciales inválidas',
      });

      // Obtener intentos restantes para informar al usuario
      const updatedRateLimit = checkRateLimit(identifier);

      return NextResponse.json(
        {
          error: 'Credenciales inválidas',
          remainingAttempts: updatedRateLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Verificar contraseña con bcrypt
    const passwordValid = await comparePassword(password, user.password);
    
    console.log('DEBUG login:', { 
      username: user.username, 
      passwordValid, 
      inputPasswordLength: password.length,
      hashLength: user.password.length 
    });

    if (!passwordValid) {
      recordFailedAttempt(identifier);

      // Log del intento fallido
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        severity: 'WARNING',
        userId: String(user.id),
        username: user.username,
        ipAddress,
        userAgent,
        resource: 'auth',
        resourceId: String(user.id),
        details: {
          reason: 'Invalid password',
        },
        success: false,
        errorMessage: 'Credenciales inválidas',
      });

      // Obtener intentos restantes para informar al usuario
      const updatedRateLimit = checkRateLimit(identifier);

      return NextResponse.json(
        {
          error: 'Credenciales inválidas',
          remainingAttempts: updatedRateLimit.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // =========================================================================
    // 4. LOGIN EXITOSO O REQUIERE 2FA
    // =========================================================================

    // Si requiere 2FA, devolver sin establecer cookies
    if (user.totpEnabled) {
      await logAuditEvent({
        action: 'LOGIN_2FA_REQUIRED',
        severity: 'INFO',
        userId: String(user.id),
        username: user.username,
        ipAddress,
        userAgent,
        resource: 'auth',
        resourceId: String(user.id),
        details: { requires_2fa: true },
        success: true,
        errorMessage: null,
      });

      return NextResponse.json({
        requires_2fa: true,
        user_id: user.id,
        message: 'Se requiere verificación de dos factores',
      });
    }

    // Login completo - generar tokens JWT
    const accessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      rol: user.rol
    });

    const refreshToken = generateRefreshToken(user.id);

    // Actualizar último acceso del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcceso: new Date() }
    });

    // Resetear rate limit en login exitoso
    recordSuccessfulAttempt(identifier);

    // Log del login exitoso
    await logAuditEvent({
      action: 'LOGIN_SUCCESS',
      severity: 'INFO',
      userId: String(user.id),
      username: user.username,
      ipAddress,
      userAgent,
      resource: 'auth',
      resourceId: String(user.id),
      details: {
        rol: user.rol,
        area: user.area,
        totp_enabled: user.totpEnabled || false,
      },
      success: true,
      errorMessage: null,
    });

    // =========================================================================
    // 5. ESTABLECER COOKIES
    // =========================================================================
    const cookieStore = await cookies();

    cookieStore.set('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    cookieStore.set('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    // Guardar información del usuario (no sensible) en cookie legible
    cookieStore.set(
      'user_info',
      JSON.stringify({
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol,
        area: user.area,
        totp_enabled: user.totpEnabled || false,
      }),
      {
        ...COOKIE_OPTIONS,
        httpOnly: false, // Esta cookie es legible por JS para la UI
        maxAge: ACCESS_TOKEN_MAX_AGE,
      }
    );

    // Devolver solo datos no sensibles al cliente
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        area: user.area,
        activo: user.activo,
        totp_enabled: user.totpEnabled || false,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);

    // Log del error
    await logAuditEvent({
      action: 'LOGIN_FAILED',
      severity: 'ERROR',
      userId: null,
      username: null,
      ipAddress,
      userAgent,
      resource: 'auth',
      resourceId: null,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      success: false,
      errorMessage: 'Error interno del servidor',
    });

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
