/**
 * API Route: CSRF Token
 *
 * Genera y devuelve un token CSRF para proteger formularios.
 * GET /api/auth/csrf
 */

import { NextResponse } from 'next/server';
import { setCsrfCookie } from '@/lib/security';

export async function GET() {
  try {
    const token = await setCsrfCookie();

    return NextResponse.json({
      csrfToken: token,
    });
  } catch (error) {
    console.error('Error generando CSRF token:', error);
    return NextResponse.json(
      { error: 'Error generando token de seguridad' },
      { status: 500 }
    );
  }
}
