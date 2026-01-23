/**
 * Sentry Server Configuration
 *
 * Configuración de Sentry para el servidor (Node.js)
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Desactivar en desarrollo
  enabled: process.env.NODE_ENV === 'production',

  // Porcentaje de requests a rastrear para performance
  tracesSampleRate: 0.1, // 10%

  // Configuración de debug
  debug: false,

  // Versión de la aplicación
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Entorno
  environment: process.env.NODE_ENV,

  // Antes de enviar el evento
  beforeSend(event) {
    // No enviar eventos en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    // Filtrar información sensible del servidor
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-forwarded-for'];
    }

    // Filtrar datos sensibles en extras
    if (event.extra) {
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
      for (const key of Object.keys(event.extra)) {
        if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
          delete event.extra[key];
        }
      }
    }

    return event;
  },

  // Ignorar ciertos errores
  ignoreErrors: [
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'EPIPE',
  ],
});
