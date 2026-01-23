/**
 * API Route: 2FA Verify
 *
 * Verifica el código 2FA y completa el login.
 * Similar al login route, establece cookies httpOnly.
 *
 * POST /api/auth/2fa/verify
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
} from '@/lib/security';

// Configuración de cookies seguras
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hora
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

interface Verify2FARequest {
  user_id: number;
  code: string;
}

interface Backend2FAResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    nombre: string;
    email: string;
    rol: string;
    area: string;
    activo: boolean;
    totp_enabled: boolean;
  };
}

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = extractRequestInfo(request);
  const identifier = getRateLimitIdentifier(request);

  try {
    // Rate limiting para 2FA también
    const rateLimitCheck = checkRateLimit(identifier);

    if (!rateLimitCheck.allowed) {
      await logAuditEvent({
        action: 'RATE_LIMIT_EXCEEDED',
        severity: 'ERROR',
        userId: null,
        username: null,
        ipAddress,
        userAgent,
        resource: 'auth/2fa',
        resourceId: null,
        details: { type: '2fa_verify' },
        success: false,
        errorMessage: rateLimitCheck.message,
      });

      return NextResponse.json(
        { error: rateLimitCheck.message },
        { status: 429 }
      );
    }

    const body: Verify2FARequest = await request.json();
    const { user_id, code } = body;

    if (!user_id || !code) {
      return NextResponse.json(
        { error: 'ID de usuario y código son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del código (6 dígitos o código de respaldo)
    const isValidFormat = /^\d{6}$/.test(code) || /^[A-Z0-9]{8}$/.test(code.toUpperCase());
    if (!isValidFormat) {
      recordFailedAttempt(identifier);
      return NextResponse.json(
        { error: 'Formato de código inválido' },
        { status: 400 }
      );
    }

    // Llamar al backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const backendResponse = await fetch(`${backendUrl}/auth/2fa/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id, code }),
    });

    if (!backendResponse.ok) {
      recordFailedAttempt(identifier);

      const errorData = await backendResponse.json().catch(() => ({}));

      await logAuditEvent({
        action: '2FA_VERIFY_FAILED',
        severity: 'WARNING',
        userId: String(user_id),
        username: null,
        ipAddress,
        userAgent,
        resource: 'auth/2fa',
        resourceId: String(user_id),
        details: { reason: errorData.detail || 'Invalid code' },
        success: false,
        errorMessage: errorData.detail || 'Código inválido',
      });

      return NextResponse.json(
        { error: errorData.detail || 'Código de verificación inválido' },
        { status: backendResponse.status }
      );
    }

    // 2FA verificado exitosamente
    const data: Backend2FAResponse = await backendResponse.json();
    const { access_token, refresh_token, user } = data;

    recordSuccessfulAttempt(identifier);

    await logAuditEvent({
      action: '2FA_VERIFY_SUCCESS',
      severity: 'INFO',
      userId: String(user.id),
      username: user.username,
      ipAddress,
      userAgent,
      resource: 'auth/2fa',
      resourceId: String(user.id),
      details: { rol: user.rol },
      success: true,
      errorMessage: null,
    });

    // Establecer cookies
    const cookieStore = await cookies();

    cookieStore.set('access_token', access_token, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    cookieStore.set('refresh_token', refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    cookieStore.set(
      'user_info',
      JSON.stringify({
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol,
        area: user.area,
        totp_enabled: user.totp_enabled,
      }),
      {
        ...COOKIE_OPTIONS,
        httpOnly: false,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      }
    );

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
        totp_enabled: user.totp_enabled,
      },
    });
  } catch (error) {
    console.error('Error en 2FA verify:', error);

    await logAuditEvent({
      action: '2FA_VERIFY_FAILED',
      severity: 'ERROR',
      userId: null,
      username: null,
      ipAddress,
      userAgent,
      resource: 'auth/2fa',
      resourceId: null,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      success: false,
      errorMessage: 'Error interno del servidor',
    });

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
