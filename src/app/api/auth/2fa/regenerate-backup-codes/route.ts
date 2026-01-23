/**
 * API Route: Regenerate Backup Codes
 *
 * Genera nuevos códigos de respaldo (requiere código TOTP).
 *
 * POST /api/auth/2fa/regenerate-backup-codes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAuditEvent, extractRequestInfo } from '@/lib/security';

interface RegenerateRequest {
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

    const body: RegenerateRequest = await request.json();
    const { code } = body;

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Código de 6 dígitos requerido' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const backendResponse = await fetch(`${backendUrl}/auth/2fa/regenerate-backup-codes`, {
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
        action: '2FA_REGENERATE_CODES_FAILED',
        severity: 'WARNING',
        userId: null,
        username: null,
        ipAddress,
        userAgent,
        resource: 'auth/2fa',
        resourceId: null,
        details: { reason: errorData.detail || 'Regenerate failed' },
        success: false,
        errorMessage: errorData.detail || 'Error regenerando códigos',
      });

      return NextResponse.json(
        { error: errorData.detail || 'Código de verificación inválido' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    await logAuditEvent({
      action: '2FA_BACKUP_CODES_REGENERATED',
      severity: 'INFO',
      userId: null,
      username: null,
      ipAddress,
      userAgent,
      resource: 'auth/2fa',
      resourceId: null,
      details: { new_codes_count: data.backup_codes?.length || 0 },
      success: true,
      errorMessage: null,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en regenerate backup codes:', error);

    await logAuditEvent({
      action: '2FA_REGENERATE_CODES_FAILED',
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
