/**
 * API Route: 2FA Setup
 *
 * Inicia la configuración de 2FA para el usuario autenticado.
 * Devuelve el QR code y códigos de respaldo.
 *
 * POST /api/auth/2fa/setup
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAuditEvent, extractRequestInfo } from '@/lib/security';

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

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const backendResponse = await fetch(`${backendUrl}/auth/2fa/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));

      await logAuditEvent({
        action: '2FA_SETUP_FAILED',
        severity: 'WARNING',
        userId: null,
        username: null,
        ipAddress,
        userAgent,
        resource: 'auth/2fa',
        resourceId: null,
        details: { reason: errorData.detail || 'Setup failed' },
        success: false,
        errorMessage: errorData.detail || 'Error en configuración de 2FA',
      });

      return NextResponse.json(
        { error: errorData.detail || 'Error al iniciar configuración de 2FA' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    await logAuditEvent({
      action: '2FA_SETUP_INITIATED',
      severity: 'INFO',
      userId: null,
      username: null,
      ipAddress,
      userAgent,
      resource: 'auth/2fa',
      resourceId: null,
      details: { backup_codes_count: data.backup_codes?.length || 0 },
      success: true,
      errorMessage: null,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en 2FA setup:', error);

    await logAuditEvent({
      action: '2FA_SETUP_FAILED',
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
