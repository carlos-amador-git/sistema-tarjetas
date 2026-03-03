/**
 * API Route: 2FA Disable
 *
 * Desactiva 2FA (requiere código de verificación).
 *
 * POST /api/auth/2fa/disable
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAuditEvent, extractRequestInfo } from '@/lib/security';

interface Disable2FARequest {
  code: string;
}

export async function POST(request: NextRequest) {
  const { ipAddress, userAgent } = extractRequestInfo(request);

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body: Disable2FARequest = await request.json();
    const { code } = body;

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Código de 6 dígitos requerido' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const backendResponse = await fetch(`${backendUrl}/auth/2fa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));

      await logAuditEvent({
        action: '2FA_DISABLE_FAILED',
        severity: 'WARNING',
        userId: null,
        username: null,
        ipAddress,
        userAgent,
        resource: 'auth/2fa',
        resourceId: null,
        details: { reason: errorData.detail || 'Disable failed' },
        success: false,
        errorMessage: errorData.detail || 'Error al desactivar 2FA',
      });

      return NextResponse.json(
        { error: errorData.detail || 'Código de verificación inválido' },
        { status: backendResponse.status }
      );
    }

    await logAuditEvent({
      action: '2FA_DISABLED',
      severity: 'WARNING',
      userId: null,
      username: null,
      ipAddress,
      userAgent,
      resource: 'auth/2fa',
      resourceId: null,
      details: {},
      success: true,
      errorMessage: null,
    });

    return NextResponse.json({ success: true, message: '2FA deshabilitado correctamente' });
  } catch (error) {
    console.error('Error en 2FA disable:', error);

    await logAuditEvent({
      action: '2FA_DISABLE_FAILED',
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
