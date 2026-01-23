/**
 * API Route: Session
 *
 * Verifica la sesión actual y devuelve información del usuario.
 * GET /api/auth/session
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface UserSession {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: string;
  area: string;
  activo: boolean;
}

export async function GET(request: NextRequest) {
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

    // Verificar token con el backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const backendResponse = await fetch(`${backendUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Si el token no es válido
    if (!backendResponse.ok) {
      // Limpiar cookies si el token expiró
      if (backendResponse.status === 401) {
        cookieStore.delete('access_token');
        cookieStore.delete('refresh_token');
        cookieStore.delete('user_info');
      }

      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    const user: UserSession = await backendResponse.json();

    return NextResponse.json({
      authenticated: true,
      user,
    });

  } catch (error) {
    console.error('Error verificando sesión:', error);

    // En caso de error de red, intentar usar la cookie user_info como fallback
    const cookieStore = await cookies();
    const userInfo = cookieStore.get('user_info')?.value;

    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return NextResponse.json({
          authenticated: true,
          user,
          offline: true, // Indicar que es datos en caché
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
