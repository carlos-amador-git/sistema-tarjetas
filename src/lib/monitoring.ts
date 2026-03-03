/**
 * Utilidades de Monitoreo
 *
 * Funciones helper para capturar errores y métricas en Sentry
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Captura un error con contexto adicional
 */
export function captureError(
  error: Error | string,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id: string | number; username?: string; email?: string };
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }
) {
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.user) {
      scope.setUser({
        id: String(context.user.id),
        username: context.user.username,
        email: context.user.email,
      });
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    Sentry.captureException(errorObj);
  });

  // También log a consola en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Monitoring]', errorObj, context);
  }
}

/**
 * Captura un mensaje informativo
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  extra?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Monitoring:${level}]`, message, extra);
  }
}

/**
 * Wrapper para capturar errores en funciones async
 */
export async function withErrorCapture<T>(
  fn: () => Promise<T>,
  context?: {
    operation: string;
    tags?: Record<string, string>;
  }
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      tags: {
        operation: context?.operation || 'unknown',
        ...context?.tags,
      },
    });
    throw error;
  }
}

/**
 * Captura evento de negocio (para analytics)
 */
export function captureBusinessEvent(
  eventName: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category: 'business',
    message: eventName,
    data,
    level: 'info',
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Business Event]', eventName, data);
  }
}

/**
 * Configura contexto de usuario para todas las capturas siguientes
 */
export function setUserContext(user: {
  id: string | number;
  username?: string;
  email?: string;
  rol?: string;
}) {
  Sentry.setUser({
    id: String(user.id),
    username: user.username,
    email: user.email,
  });

  if (user.rol) {
    Sentry.setTag('user.rol', user.rol);
  }
}

/**
 * Limpia contexto de usuario (en logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Añade breadcrumb para debugging
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
    timestamp: Date.now() / 1000,
  });
}
