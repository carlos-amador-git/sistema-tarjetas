/**
 * API Route: Session
 *
 * Verifica la sesión actual y devuelve información del usuario.
 * GET /api/auth/session
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // Si no hay token, no hay sesión
    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    // Verificar token JWT directamente
    try {
      const payload = verifyAccessToken(accessToken);

      // Obtener info adicional de la cookie user_info
      const userInfo = cookieStore.get('user_info')?.value;
      let user = {
        id: payload.userId,
        username: payload.username,
        rol: payload.rol,
      };

      if (userInfo) {
        try {
          const parsedUserInfo = JSON.parse(decodeURIComponent(userInfo));
          user = { ...user, ...parsedUserInfo };
        } catch {
          // Cookie corrupta, usar datos del JWT
        }
      }

      return NextResponse.json({
        authenticated: true,
        user,
      });
    } catch {
      // Token inválido o expirado
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Error verificando sesión:', error);

    // En caso de error, intentar usar la cookie user_info como fallback
    const cookieStore = await cookies();
    const userInfo = cookieStore.get('user_info')?.value;

    if (userInfo) {
      try {
        const user = JSON.parse(decodeURIComponent(userInfo));
        return NextResponse.json({
          authenticated: true,
          user,
          offline: true,
        });
      } catch {
        // Cookie corrupta
      }
    }

    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}
