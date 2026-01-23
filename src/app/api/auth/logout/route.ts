/**
 * API Route: Logout
 *
 * Limpia las cookies de autenticación.
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Obtener token para notificar al backend (opcional)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // Intentar notificar al backend del logout (mejor esfuerzo)
    if (accessToken) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      try {
        await fetch(`${backendUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } catch {
        // Ignorar errores del backend, igual limpiamos las cookies
      }
    }

    // Limpiar todas las cookies de autenticación
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('user_info');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error en logout:', error);

    // Aún así intentar limpiar cookies
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('user_info');

    return NextResponse.json({ success: true });
  }
}
