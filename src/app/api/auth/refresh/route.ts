/**
 * API Route: Refresh Token
 *
 * Renueva el access token usando el refresh token.
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Nota: secure: true solo funciona con HTTPS. En localhost HTTP, debe ser false.
const isSecure = process.env.NODE_ENV === 'production' && process.env.ALLOW_HTTP_COOKIES !== 'true';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isSecure,
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hora

interface RefreshResponse {
  access_token: string;
  user?: {
    id: number;
    username: string;
    nombre: string;
    email: string;
    rol: string;
    area: string;
    activo: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Si no hay refresh token, no se puede renovar
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    // Llamar al backend para renovar el token
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    const backendResponse = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!backendResponse.ok) {
      // Refresh token expirado o inválido, limpiar todo
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      cookieStore.delete('user_info');

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const data: RefreshResponse = await backendResponse.json();
    const { access_token, user } = data;

    // Actualizar access token
    cookieStore.set('access_token', access_token, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    // Actualizar user_info si viene en la respuesta
    if (user) {
      cookieStore.set('user_info', JSON.stringify({
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        rol: user.rol,
        area: user.area,
      }), {
        ...COOKIE_OPTIONS,
        httpOnly: false,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
    }

    return NextResponse.json({
      success: true,
      user: user || null,
    });

  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Error refreshing session' },
      { status: 500 }
    );
  }
}
