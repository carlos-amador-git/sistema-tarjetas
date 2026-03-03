import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTenantByHost } from '@/config/tenants';

/**
 * Proxy para Multi-Tenant (Next.js 16+)
 *
 * Este proxy se ejecuta en cada request y:
 * 1. Detecta el tenant basado en el hostname
 * 2. Inyecta la configuración del tenant en los headers
 * 3. Verifica autenticación usando httpOnly cookies
 * 4. Maneja redirecciones según el estado de autenticación
 *
 * SEGURIDAD: Los tokens se almacenan en httpOnly cookies
 * que NO son accesibles desde JavaScript del cliente.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host');

  // Obtener configuración del tenant
  const tenant = getTenantByHost(host);

  // Crear response con headers de tenant
  const response = NextResponse.next();

  // Inyectar información del tenant en headers (disponible en Server Components)
  response.headers.set('x-tenant-id', tenant.id);
  response.headers.set('x-tenant-name', tenant.name);

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Rutas de assets y API que no necesitan procesamiento
  const skipPaths = ['/_next', '/favicon.ico', '/images', '/tenants'];
  const shouldSkip = skipPaths.some(path => pathname.startsWith(path));

  if (shouldSkip) {
    return response;
  }

  // Verificar token de autenticación desde httpOnly cookie
  // NOTA: access_token es httpOnly, solo el servidor puede leerlo
  const token = request.cookies.get('access_token')?.value;

  // Si no está autenticado y trata de acceder a ruta protegida
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado y trata de acceder a login, redirigir a dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Configurar en qué rutas se ejecuta el proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)',
  ],
};
